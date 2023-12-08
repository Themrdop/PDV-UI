using Products.Interfaces;
using Products.Models;
using RabbitMQHandler;
using System.Text;
using System.Text.Json;

namespace ElectronicBill;

public class ElectronicBillServices
{
    private readonly ILogger _logger;
    private readonly IElectronicBill _electronicBill;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IMessageQueue _messageQueue;

    private readonly string _baseURL;

    public ElectronicBillServices(ILogger<ElectronicBillServices> logger,
                                  IElectronicBill electronicBill,
                                  IHttpClientFactory httpClientFactory,
                                  IMessageQueue messageQueue,
                                  string baseURL)
    {
        _logger = logger;
        _electronicBill = electronicBill;
        _httpClientFactory = httpClientFactory;
        _messageQueue = messageQueue;
        _baseURL = baseURL;
    }

    public void RegisterListener()
    {
        MessageQueue.ListenForIntegrationEvents(async jsonString =>
        {
            try
            {
                _logger.LogInformation($"Received message: {jsonString}");

                Bill? bill = JsonSerializer.Deserialize<Bill>(jsonString);

                if (bill == null)
                {
                    _logger.LogError("Error deserializing bill");
                    return;
                }

                byte[]? certificate = await getCertificate(bill, CancellationToken.None);

                if (certificate == null)
                {
                    _logger.LogError("Error getting certificate");
                    return;
                }

                var comercio = await _httpClientFactory.CreateClient().GetAsync($"{_baseURL}/GetCommerceInformation", CancellationToken.None);

                var commersInfo = JsonSerializer.Deserialize<CommerceInformation>(await comercio.Content.ReadAsStringAsync());

                var billFull = await _electronicBill.SendElectronicBill(bill, certificate, commersInfo.pinCertificado, CancellationToken.None);

                var serializedBillFull = JsonSerializer.Serialize(billFull);
                var content = new StringContent(serializedBillFull, Encoding.UTF8, "application/json");

                await _httpClientFactory.CreateClient().PutAsync($"{_baseURL}/AddElectronicBill", content);

                _messageQueue.PublishToMessageQueue(MessageQueue.QUEUE_SEND_EMAIL, serializedBillFull);

                Console.WriteLine($"Bill sent: {serializedBillFull}");

            }
            catch (Exception ex)
            {
                _logger.LogError("Exception processing message {message}", ex.Message);
            }

        });
    }

    private async Task<byte[]?> getCertificate(Bill bill, CancellationToken none)
    {
        var response = await _httpClientFactory.CreateClient().GetAsync($"{_baseURL}/GetCommerceInformation", none);

        var commersInfo = JsonSerializer.Deserialize<CommerceInformation>(await response.Content.ReadAsStringAsync());

        var certificate = await _httpClientFactory.CreateClient().GetAsync($"{_baseURL}/GetCertificate?commersName={commersInfo.name}", none);

        var stream = await certificate.Content.ReadAsStreamAsync();

        using var memoryStream = new MemoryStream();

        await stream.CopyToAsync(memoryStream);

        return memoryStream.ToArray();
    }
}