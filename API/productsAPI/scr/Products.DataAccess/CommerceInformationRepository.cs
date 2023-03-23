using MongoDB.Driver;
using Products.Interfaces;
using Products.Models;

namespace Products.DataAccess{
    public class CommerceInformationRepository : ICommerceInformationRepository
    {
        private readonly DataBaseImplementation _database;
        
        public CommerceInformationRepository(DataBaseImplementation database)
        {
            _database = database;
        }
        
        public async Task<CommerceInformation> GetCommerceInformation(CancellationToken cancellationToken)
        {
            var commerceInformation = await _database.CommerceInformation.FindAsync(Builders<CommerceInformation>.Filter.Empty, null, cancellationToken);

            var commerceInformationresult = commerceInformation.FirstOrDefault();

            if (commerceInformationresult is null)
                return new CommerceInformation();

            return commerceInformationresult;
        }
        
        public async Task<CommerceInformation> UpdateCommerceInformation(CommerceInformation commerceInformation, CancellationToken cancellationToken)
        {
            var filter = Builders<CommerceInformation>.Filter.Eq(p => p.name, commerceInformation.name);

            var result = await _database.CommerceInformation.ReplaceOneAsync(filter, commerceInformation);

            if (result.ModifiedCount <= 0){
                await _database.CommerceInformation.InsertOneAsync(commerceInformation);
            }

            return commerceInformation;
        }
    }
}