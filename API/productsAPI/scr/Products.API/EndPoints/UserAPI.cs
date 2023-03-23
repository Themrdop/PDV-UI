public class UserAPI{

    internal static async Task<IResult> GetUsers(IUserRepository userRepository, 
                                                 ILogger<User> logger, 
                                                 CancellationToken cancellationToken)
    {
        try
        {
            var response = await userRepository.GetUsers(cancellationToken);
            logger?.LogInformation("Se consultaron los usuarios: {users}", response);
            
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error consultando usuarios, exception: {ex}", ex);
            
            return Results.Problem(ex.Message);
        }
    }
    internal static async Task<IResult> GetUserById(string id, 
                                                    IUserRepository userRepository, 
                                                    ILogger<User> logger, 
                                                    CancellationToken cancellationToken)
    {
        try
        {
            var response = await userRepository.GetUserById(id, cancellationToken);
            logger?.LogInformation("Se consulto el usuario: {user}", response);
            
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error consultando usuario, exception: {ex}", ex);
            
            return Results.Problem(ex.Message);
        }
    }

    internal static async Task<IResult> SaveUser(User user, 
                                                 IUserRepository userRepository, 
                                                 ILogger<User> logger, 
                                                 CancellationToken cancellationToken)
    {
        try
        {
            if(user is null)
                return Results.BadRequest();
            
            var response = await userRepository.SaveUser(user, cancellationToken);
            logger?.LogInformation("Se guardo el usuario: {user}", response);
            
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error guardando usuario, exception: {ex}", ex);
            
            return Results.Problem(ex.Message);
        }
    }

    internal static async Task<IResult> UpdateUser(User user, 
                                                   IUserRepository userRepository, 
                                                   ILogger<User> logger, 
                                                   CancellationToken cancellationToken)
    {
        try
        {
            if(user is null)
                return Results.BadRequest();
            
            var response = await userRepository.UpdateUser(user, cancellationToken);
            logger?.LogInformation("Se actualizo el usuario: {user}", response);
            
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error actualizando usuario, exception: {ex}", ex);
            
            return Results.Problem(ex.Message);
        }
    }

    internal static async Task<IResult> DeleteUser(string id, 
                                                   IUserRepository userRepository, 
                                                   ILogger<User> logger, 
                                                   CancellationToken cancellationToken)
    {
        try
        {
            var response = await userRepository.DeleteUser(id, cancellationToken);
            logger?.LogInformation("Se elimino el usuario: {user}", response);
            
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error eliminando usuario, exception: {ex}", ex);
            
            return Results.Problem(ex.Message);
        }
    }
}