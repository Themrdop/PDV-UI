using ElectronicBill;
using Microsoft.Extensions.Caching.Memory;
using Products.Interfaces;
using RabbitMQHandler;

var builder = WebApplication.CreateBuilder(args);

#if DEBUG 
builder.Configuration.AddJsonFile("appsettings.Development.json", false, true);
#else
builder.Configuration.AddJsonFile("appsettings.json", false, true);
#endif

string userName = builder.Configuration["userName"],
password = builder.Configuration["password"],
endpoint = builder.Configuration["endpoint"],
JWT_Endpoint = builder.Configuration["JWT_Endpoint"],
clientId = builder.Configuration["clientId"];


builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

builder.Services.AddSingleton<IElectronicBill>(new Domain.ElectronicBill.ElectronicBill(userName,
                                                                                        password,
                                                                                        JWT_Endpoint,
                                                                                        endpoint,
                                                                                        clientId,
                                                                                        builder.Services.BuildServiceProvider().GetService<IMemoryCache>() ?? throw new ArgumentException("IMemoryCache not found"),
                                                                                        builder.Services.BuildServiceProvider().GetService<IHttpClientFactory>() ?? throw new ArgumentException("IHttpClientFactory not found")));
builder.Services.AddSingleton(new Func<IServiceProvider, ElectronicBillServices>(provider =>
{
  var configuration = provider.GetRequiredService<IConfiguration>();
  var logger = provider.GetRequiredService<ILogger<ElectronicBillServices>>();
  var electronicBill = provider.GetRequiredService<IElectronicBill>();
  var httpClientFactory = provider.GetRequiredService<IHttpClientFactory>();
  var messageQueue = provider.GetRequiredService<IMessageQueue>();
  var baseURL = configuration["apiBaseURL"];
  return new ElectronicBillServices(logger, electronicBill, httpClientFactory, messageQueue, baseURL);
}));
builder.Services.AddSingleton(new Func<IServiceProvider, IMessageQueue>(provider =>
{
  var configuration = provider.GetRequiredService<IConfiguration>();
  var hostName = configuration["RabbitMQ:HostName"];
  return new MessageQueue(hostName!);
}));

builder.Services.BuildServiceProvider().GetService<ElectronicBillServices>()?.RegisterListener();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();

