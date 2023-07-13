using MongoDB.Bson;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Driver;
using Products.Models;

namespace Products.DataAccess
{
    /// <summary>
    /// The implementation for the DataBase
    /// </summary>
    /// <typeparam name="T">Type or the representation of the Collection</typeparam>
    public class DataBaseImplementation
    {
        private readonly IMongoClient _mongoClient;
        public IMongoDatabase database {get; internal set;}
        public DataBaseImplementation(string connectionString, string? dataBase = null)
        {
            _mongoClient = new MongoClient(connectionString);
            database = _mongoClient.GetDatabase(dataBase is null? "PDV" : dataBase);

            //add the ConventionPack and register the convention to avoid adding tags to models
            var pack = new ConventionPack();
            var conventionPack = new ConventionPack { new IgnoreExtraElementsConvention(true) };
            ConventionRegistry.Register("IgnoreExtraElements", conventionPack, type => true);
        }

        
    }
}
