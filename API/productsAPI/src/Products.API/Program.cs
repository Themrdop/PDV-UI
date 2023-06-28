using Microsoft.Extensions.Caching.Memory;

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

builder.Configuration.AddJsonFile("appsettings.json", false, true);

if (!string.IsNullOrWhiteSpace(builder.Configuration["MongoUri"]))
{
  builder.Services.AddSingleton<DataBaseImplementation>(new DataBaseImplementation(builder.Configuration["MongoUri"]));
}
string userName = builder.Configuration["userName"],
password = builder.Configuration["password"],
thumbprintCertificado = builder.Configuration["thumbprintCertificado"];
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

builder.Services.AddSingleton<IElectronicBill>(new Products.API.ElectronicBill.ElectronicBill(userName,
                                                                                              password,
                                                                                              thumbprintCertificado,
                                                                                              builder.Services.BuildServiceProvider().GetService<IMemoryCache>(),
                                                                                              builder.Services.BuildServiceProvider().GetService<IHttpClientFactory>()));

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
