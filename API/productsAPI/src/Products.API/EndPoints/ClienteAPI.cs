public class ClientAPI
{
  public static async Task<IResult> GetClient(string numeroIdentificacion,
                                                IClientRepository clientRepository,
                                                ILogger<ClientAPI> logger,
                                                CancellationToken cancellationToken)
  {
    try
    {
      var client = await clientRepository.GetClient(numeroIdentificacion, cancellationToken);
      logger?.LogInformation($"Cliente consultado con exito, cedula: {numeroIdentificacion}");
      return Results.Ok(client?.FirstOrDefault());
    }
    catch (Exception ex)
    {
      logger?.LogError("Error consultando cliente, exception: {ex}", ex);
      return Results.Problem(ex.Message);
    }
  }

  public static async Task<IResult> AddClient(Person person,
                                                IClientRepository clientRepository,
                                                ILogger<ClientAPI> logger,
                                                CancellationToken cancellationToken)
  {
    try
    {
      var client = await clientRepository.AddClient(person, cancellationToken);
      logger?.LogInformation($"Cliente creado con exito identificacion: {person.numeroIdentificacion}");
      return Results.Ok(client);
    }
    catch (Exception ex)
    {
      logger?.LogError("Error creando cliente, exception: {ex}", ex);
      return Results.Problem(ex.Message);
    }
  }
}