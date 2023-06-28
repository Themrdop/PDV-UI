public static class CombosAPI{

    internal static async Task<IResult> GetComboById(string id, 
                                                     IComboRepository comboRepository, 
                                                     ILogger<Combo> logger, 
                                                     CancellationToken cancellationToken)
    {
        try
        {
            var response = await comboRepository.GetComboById(id, cancellationToken);
            logger?.LogInformation("Se consulto el combo: {combo}", response);
            
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error consultando combo, exception: {ex}", ex);
            
            return Results.Problem(ex.Message);
        }
    }

    internal static async Task<IResult> GetCombos(IComboRepository comboRepository, 
                                                  ILogger<Combo> logger, 
                                                  CancellationToken cancellationToken)
    {
        try
        {
            var response = await comboRepository.GetCombos(cancellationToken);
            logger?.LogInformation("Se consulto los combos: {combo}", response);
            
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error consultando combos, exception: {ex}", ex);
            
            return Results.Problem(ex.Message);
        }
    }

    internal static async Task<IResult> SaveCombo(Combo combo, 
                                                  IComboRepository comboRepository, 
                                                  ILogger<Combo> logger, 
                                                  CancellationToken cancellationToken)
    {
        try
        {
            if(combo is null)
                return Results.BadRequest();
            
            var response = await comboRepository.SaveCombo(combo, cancellationToken);
            logger?.LogInformation("Se guardo el combo: {combo}", response);
            
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error guardando combo, exception: {ex}", ex);
            
            return Results.Problem(ex.Message);
        }
    }

    internal static async Task<IResult> UpdateCombo(Combo combo, 
                                                    IComboRepository comboRepository, 
                                                    ILogger<Combo> logger, 
                                                    CancellationToken cancellationToken)
    {
        try
        {
            if(combo is null)
                return Results.BadRequest();
            
            var response = await comboRepository.UpdateCombo(combo, cancellationToken);
            logger?.LogInformation("Se actualizo el combo: {combo}", response);
            
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error actualizando combo, exception: {ex}", ex);
            
            return Results.Problem(ex.Message);
        }
    }

    internal static async Task<IResult> DeleteCombo(string id, 
                                                    IComboRepository comboRepository, 
                                                    ILogger<Combo> logger, 
                                                    CancellationToken cancellationToken)
    {
        try
        {
            var response = await comboRepository.DeleteCombo(id, cancellationToken);
            logger?.LogInformation("Se elimino el combo: {combo}", response);
            
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error eliminando combo, exception: {ex}", ex);
            
            return Results.Problem(ex.Message);
        }
    }
}