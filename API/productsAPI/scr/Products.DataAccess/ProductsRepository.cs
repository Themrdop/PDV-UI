using MongoDB.Driver;
using Products.Interfaces;
using Products.Models;

namespace Products.DataAccess
{
    public class ProductsRepository : IProductsRepository
    {
        private readonly DataBaseImplementation _database;

        public ProductsRepository(DataBaseImplementation _database)
        {
            this._database = _database;
        }

        public async Task<IEnumerable<Product>> GetAllProducts(CancellationToken cancellationToken)
        {
            var baseProducts = await _database.Products.FindAsync(Builders<Product>.Filter.Empty, null, cancellationToken);

            var products = await baseProducts.ToListAsync();

            if (products is null)
                return new List<Product>();

            return products;
        }

        public async Task<Product?> ProductById(string? ProductId, CancellationToken cancellationToken)
        {
            var filter = Builders<Product>.Filter.Eq(p => p.id, ProductId);

            var dataBasePoints = await _database.Products.FindAsync(filter, null, cancellationToken);

            var product = dataBasePoints.FirstOrDefault();

            if (product is null)
                return null;

            return product;
        }

        public async Task<Product?> AddProduct(Product product, CancellationToken cancellationToken)
        {
            product.id = Guid.NewGuid().ToString();

            await _database.Products.InsertOneAsync(product,null,cancellationToken);

            return product;
        }

        public async Task<bool> DeleteProduct(string ProductId, CancellationToken cancellationToken)
        {
            var filter = Builders<Product>.Filter.Eq(p => p.id, ProductId);
            
            var result = await _database.Products.DeleteOneAsync(filter,null,cancellationToken);

            return result.DeletedCount > 0;
        }

        public async Task<Product> UpdateProduct(Product product, CancellationToken cancellationToken)
        {
            var filter = Builders<Product>.Filter.Eq(p => p.id, product.id);

            var updateDefinition = Builders<Product>.Update
                .Set(p => p.title, product.title)
                .Set(p => p.price, product.price)
                .Set(p => p.amount, product.amount)
                .Set(p => p.image, product.image);

            var updateOptions = new UpdateOptions { IsUpsert = true };
            
            var result = await _database.Products.UpdateOneAsync(filter, updateDefinition, updateOptions, cancellationToken);

            return product;
        }
    }
}