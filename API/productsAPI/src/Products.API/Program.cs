using AzureServiceBus;
using RabbitMQHandler;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(p => p.AddPolicy("corsapp", builder =>
    {
      builder.WithOrigins("*").AllowAnyMethod().AllowAnyHeader();
    }));

builder.Services.AddCors();

builder.Host.ConfigureLogging(logging =>
{
  logging.ClearProviders();
  logging.AddConsole();
});

builder.Services.AddSingleton<IProductsRepository, ProductsRepository>();
builder.Services.AddSingleton<IBillRepository, BillRepository>();
builder.Services.AddSingleton<ICommerceInformationRepository, CommerceInformationRepository>();
builder.Services.AddSingleton<IUserRepository, UserRepository>();
builder.Services.AddSingleton<IComboRepository, ComboRepository>();
builder.Services.AddSingleton<IClientRepository, ClientRepository>();
builder.Services.AddSingleton<IAzureServicesBusHandler, AzureServicesBusHandler>();

#if DEBUG 
builder.Configuration.AddJsonFile("appsettings.Development.json", false, true);
#else
builder.Configuration.AddJsonFile("appsettings.json", false, true);
#endif


var mongoUri = builder.Configuration["MongoUri"];
if (!string.IsNullOrWhiteSpace(mongoUri))
{
  builder.Services.AddSingleton(new DataBaseImplementation(mongoUri!));
}

builder.Services.AddSingleton<IMessageQueue>(new Func<IServiceProvider, IMessageQueue>(provider =>
{
  var configuration = provider.GetRequiredService<IConfiguration>();
  var hostName = configuration["RabbitMQ:HostName"];
  return new MessageQueue(hostName!);
}));

builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
  c.SwaggerDoc("v1", new() { Title = "Products API", Version = "v1" });
});

var app = builder.Build();

app.MapGet("/", () => "I'm alive!");

app.ConfigureApi();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("corsapp");

app.Run();