using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;

namespace RabbitMQHandler;
public class MessageQueue :IMessageQueue
{
    public static readonly string QUEUE_SEND_ELECTRONIC_BILL = "product.sendelectronicbill";
    public static readonly string QUEUE_SEND_EMAIL = "product.SendEmail";

    private static readonly ConnectionFactory _factory = new ConnectionFactory { HostName = "192.168.0.4" };

    public void PublishToMessageQueue(string integrationEvent, string eventData)
    {
        using var connection = _factory.CreateConnection();
        using var channel = connection.CreateModel();

        channel.QueueDeclare(queue: integrationEvent,
                     durable: false,
                     exclusive: false,
                     autoDelete: false,
                     arguments: null);

        var body = Encoding.UTF8.GetBytes(eventData);

        channel.BasicPublish(exchange: string.Empty,
                                         routingKey: integrationEvent,
                                         basicProperties: null,
                                         body: body);
    }

    public static void ListenForIntegrationEvents(Action<string> func)
    {
        var connection = _factory.CreateConnection();
        var channel = connection.CreateModel();
        var consumer = new EventingBasicConsumer(channel);

        consumer.Received += (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            func(message);
        };
        channel.BasicConsume(queue: QUEUE_SEND_ELECTRONIC_BILL,
                                 autoAck: true,
                                 consumer: consumer);
    }
}


public interface IMessageQueue
{
    void PublishToMessageQueue(string integrationEvent, string eventData);
}