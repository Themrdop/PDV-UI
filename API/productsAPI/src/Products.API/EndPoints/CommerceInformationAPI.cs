using System.Net;

public static class CommerceInformationAPI
{
    internal static async Task<IResult> updateCommerceInformation(CommerceInformation commerceInformation,
                                                                  ICommerceInformationRepository commerceInformationRepository,
                                                                  ILogger<CommerceInformation> logger,
                                                                  CancellationToken cancellationToken)
    {
        try
        {
            if (commerceInformation is null)
                return Results.BadRequest();

            var response = await commerceInformationRepository.UpdateCommerceInformation(commerceInformation, cancellationToken);
            logger?.LogInformation("Se actualizo la informacion del comercio: {commerceInformation}", commerceInformation);

            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error actualizando informacion del comercio, exception: {ex}", ex);

            return Results.Problem(ex.Message);
        }
    }

    internal static async Task<IResult> getCommerceInformation(ICommerceInformationRepository commerceInformationRepository,
                                                               ILogger<CommerceInformation> logger,
                                                               CancellationToken cancellationToken)
    {
        try
        {
            var response = await commerceInformationRepository.GetCommerceInformation(cancellationToken);
            logger?.LogInformation("Se consulto la informacion del comercio: {commerceInformation}", response);

            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error consultando informacion del comercio, exception: {ex}", ex);

            return Results.Problem(ex.Message);
        }
    }

    internal static async Task<IResult> SaveCertificateForCommerceAsync(Stream certificate,
                                                                        ICommerceInformationRepository commerceInformationRepository,
                                                                        ILogger<CommerceInformation> logger,
                                                                        CancellationToken cancellationToken)
    {
        try
        {
            if (certificate is null)
                return Results.BadRequest();

            var commerceInformation = await commerceInformationRepository.GetCommerceInformation(cancellationToken);

            var response = await commerceInformationRepository.SaveCertificate(certificate, commerceInformation, cancellationToken);

            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error guardando certificado, exception: {ex}", ex);

            return Results.Problem(ex.Message);
        }
    }

    internal static async Task<IResult> GetCertificate(string commersName,
                                                       ICommerceInformationRepository commerceInformationRepository,
                                                       ILogger<CommerceInformation> logger,
                                                       CancellationToken cancellationToken)
    {
        try
        {
            var response = await commerceInformationRepository.GetCertificate(commersName, cancellationToken);

            if (response is not null)
            {
                var Stream = new MemoryStream(response);
                
                return Results.Stream(Stream);
            }

            return Results.NotFound();
        }
        catch (Exception ex)
        {
            logger?.LogError("Error guardando certificado, exception: {ex}", ex);

            return Results.Problem(ex.Message);
        }
    }
}