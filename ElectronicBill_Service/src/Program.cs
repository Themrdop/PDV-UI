var builder = WebApplication.CreateBuilder(args);

#if DEBUG 
builder.Configuration.AddJsonFile("appsettings.Development.json", false, true);
#else
builder.Configuration.AddJsonFile("appsettings.json", false, true);
#endif

string userName = builder.Configuration["userName"] ?? string.Empty,
password = builder.Configuration["password"] ?? string.Empty,
endpoint = builder.Configuration["endpoint"] ?? string.Empty,
JWT_Endpoint = builder.Configuration["JWT_Endpoint"] ?? string.Empty,
clientId = builder.Configuration["clientId"] ?? string.Empty;


builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

builder.Services.AddSingleton<IElectronicBill>(provider =>
{
  var memoryCache = provider.GetRequiredService<IMemoryCache>() ?? throw new ArgumentException("IMemoryCache not found");
  var httpClientFactory = provider.GetRequiredService<IHttpClientFactory>() ?? throw new ArgumentException("IHttpClientFactory not found");

  return new Domain.ElectronicBill.ElectronicBill(userName,
                      password,
                      JWT_Endpoint,
                      endpoint,
                      clientId,
                      memoryCache,
                      httpClientFactory);
});
builder.Services.AddSingleton(new Func<IServiceProvider, ElectronicBillServices>(provider =>
{
  var configuration = provider.GetRequiredService<IConfiguration>();
  var logger = provider.GetRequiredService<ILogger<ElectronicBillServices>>();
  var electronicBill = provider.GetRequiredService<IElectronicBill>();
  var httpClientFactory = provider.GetRequiredService<IHttpClientFactory>();
  var messageQueue = provider.GetRequiredService<IMessageQueue>();
  var baseURL = configuration["apiBaseURL"] ?? string.Empty;
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

app.Run();

