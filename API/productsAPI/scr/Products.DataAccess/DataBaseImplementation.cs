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
        private readonly IMongoDatabase _database;
        public DataBaseImplementation(string connectionString, string? dataBase = null)
        {
            _mongoClient = new MongoClient(connectionString);
            _database = _mongoClient.GetDatabase(dataBase is null? "PDV" : dataBase);

            //add the ConventionPack and register the convention to avoid adding tags to models
            var pack = new ConventionPack();
            var conventionPack = new ConventionPack { new IgnoreExtraElementsConvention(true) };
            ConventionRegistry.Register("IgnoreExtraElements", conventionPack, type => true);


            Products = _database.GetCollection<Product>("Products");
            Bills = _database.GetCollection<Bill>("Bills");
            CommerceInformation = _database.GetCollection<CommerceInformation>("CommerceInformation");
            Users = _database.GetCollection<User>("Users");
            Combos = _database.GetCollection<Combo>("Combos");
        }

        public IMongoCollection<Product> Products { get; internal set; }
        public IMongoCollection<Bill> Bills { get; internal set; }
        public IMongoCollection<CommerceInformation> CommerceInformation { get; internal set; }
        public IMongoCollection<User> Users { get; internal set; }
        public IMongoCollection<Combo> Combos { get; internal set; }
    }
}
