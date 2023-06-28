public static class CommerceInformationAPI{
    internal static async Task<IResult> updateCommerceInformation(CommerceInformation commerceInformation, 
                                                                  ICommerceInformationRepository commerceInformationRepository,
                                                                  ILogger<CommerceInformation> logger,
                                                                  CancellationToken cancellationToken)
    {
        try
        {
            if(commerceInformation is null)
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
}