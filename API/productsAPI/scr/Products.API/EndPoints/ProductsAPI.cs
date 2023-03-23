public static class ProductsAPI{

    internal static async Task<IResult> DeleteProduct(string? ProductId, 
                                                      IProductsRepository productsRepository,
                                                      ILogger<Product> logger,
                                                      CancellationToken cancellationToken)
    {
        if(string.IsNullOrEmpty(ProductId) || string.IsNullOrWhiteSpace(ProductId))
            return Results.BadRequest();
        
        try
        {
            var responce = await productsRepository.DeleteProduct(ProductId, cancellationToken);

            return Results.Ok(responce);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error eliminando producto, exception: {ex}", ex);

            return Results.Problem(ex.Message);
        }
    }

    internal static async Task<IResult> UpdateProduct(Product product, 
                                                      IProductsRepository productsRepository,
                                                      ILogger<Product> logger,
                                                      CancellationToken cancellationToken)
    {
        try
        {
            if(product is null)
                return Results.BadRequest();

            var response = await productsRepository.UpdateProduct(product, cancellationToken);
            logger?.LogInformation("Se actualizo el producto: {products}", product);

            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error actualizando producto, exception: {ex}", ex);

            return Results.Problem(ex.Message);
        }
    }

    internal static async Task<IResult> AddProducts(Product product, 
                                                    IProductsRepository productsRepository,
                                                    ILogger<Product> logger,
                                                    CancellationToken cancellationToken){
        try
        {
            if(product is null)
                return Results.BadRequest();

            var response = await productsRepository.AddProduct(product, cancellationToken);
            logger?.LogInformation("Se inserto el producto: {products}", product);

            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error agregando producto, exception: {ex}", ex);

            return Results.Problem(ex.Message);
        }
    }

    internal static async Task<IResult> GetAllProducts(string? ProductId, 
                                                       IProductsRepository products,
                                                       ILogger<Product> logger,
                                                       CancellationToken cancellationToken)
    {
        try
        {
            IEnumerable<Product>? response = null;

            if (ProductId is not null){
                response = new List<Product>() {await products.ProductById(ProductId, cancellationToken)};
                logger?.LogInformation("Se consulto el producto {ProductId}", ProductId);
            }else{
                response = await products.GetAllProducts(cancellationToken);
                logger?.LogInformation("Todos los productos fueron consultados");
            }

            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger?.LogError("Error cosultando productos, exception: {ex}", ex);

            return Results.Problem(ex.Message);
        }
    }
}