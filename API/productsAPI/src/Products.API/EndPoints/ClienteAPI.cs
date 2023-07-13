public class ClientAPI
{
  internal static async Task<IResult> GetClient(string numeroIdentificacion,
                                                IClientRepository clientRepository,
                                                ILogger<Product> logger,
                                                CancellationToken cancellationToken)
  {
    try
    {
      var client = await clientRepository.GetClient(numeroIdentificacion, cancellationToken);
      logger?.LogInformation("Cliente consultado con exito");
      return Results.Ok(client);
    }
    catch (Exception ex)
    {
      logger?.LogError("Error consultando cliente, exception: {ex}", ex);
      return Results.Problem(ex.Message);
    }
  }

  internal static async Task<IResult> AddClient(Person person,
                                                IClientRepository clientRepository,
                                                ILogger<Product> logger,
                                                CancellationToken cancellationToken)
  {
    try
    {
      var client = await clientRepository.AddClient(person, cancellationToken);
      logger?.LogInformation("Cliente creado con exito");
      return Results.Ok(client);
    }
    catch (Exception ex)
    {
      logger?.LogError("Error creando cliente, exception: {ex}", ex);
      return Results.Problem(ex.Message);
    }
  }
}