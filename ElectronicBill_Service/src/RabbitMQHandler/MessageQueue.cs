namespace RabbitMQHandler;
public class MessageQueue : IMessageQueue
{
    public static readonly string QUEUE_SEND_ELECTRONIC_BILL = "product.sendelectronicbill";
    public static readonly string QUEUE_SEND_EMAIL = "product.SendEmail";

    private static readonly ConnectionFactory _factory = new ConnectionFactory { HostName = "localhost" };

    public MessageQueue(string hostName)
    {
        _factory.HostName = hostName;
    }

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
            try
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                func(message);
            }
            catch (Exception ex)
            {
                channel.BasicReject(ea.DeliveryTag, true);
                Console.WriteLine($"Rejecting message and putting it back to the queue:\n{ex.Message}");
                Console.WriteLine(ex.Message);
            }
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