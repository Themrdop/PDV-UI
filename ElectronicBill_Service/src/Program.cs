using ElectronicBill;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
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
JWT_Endpoint = builder.Configuration["JWT_Endpoint"];

builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

builder.Services.AddSingleton<IElectronicBill>(new Domain.ElectronicBill.ElectronicBill(userName,
                                                                                        password,
                                                                                        JWT_Endpoint,
                                                                                        endpoint,
                                                                                        builder.Services.BuildServiceProvider().GetService<IMemoryCache>() ?? throw new ArgumentException("IMemoryCache not found"),
                                                                                        builder.Services.BuildServiceProvider().GetService<IHttpClientFactory>() ?? throw new ArgumentException("IHttpClientFactory not found")));
builder.Services.AddSingleton<ElectronicBillServices>();
builder.Services.AddSingleton<IMessageQueue,MessageQueue>();

builder.Services.BuildServiceProvider().GetService<ElectronicBillServices>()?.RegisterListener();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();

