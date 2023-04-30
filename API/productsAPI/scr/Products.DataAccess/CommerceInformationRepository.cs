using MongoDB.Driver;
using Products.Interfaces;
using Products.Models;

namespace Products.DataAccess{
    public class CommerceInformationRepository : ICommerceInformationRepository
    {
        private IMongoCollection<CommerceInformation> CommerceInformation { get; set; }
        
        public CommerceInformationRepository(DataBaseImplementation mongo)
        {
            CommerceInformation = mongo.database.GetCollection<CommerceInformation>("CommerceInformation");
        }
        
        public async Task<CommerceInformation> GetCommerceInformation(CancellationToken cancellationToken)
        {
            var commerceInformation = await CommerceInformation.FindAsync(Builders<CommerceInformation>.Filter.Empty, null, cancellationToken);

            var commerceInformationresult = commerceInformation.FirstOrDefault();

            if (commerceInformationresult is null)
                return new CommerceInformation();

            return commerceInformationresult;
        }
        
        public async Task<CommerceInformation> UpdateCommerceInformation(CommerceInformation commerceInformation, CancellationToken cancellationToken)
        {
            var filter = Builders<CommerceInformation>.Filter.Eq(p => p.name, commerceInformation.name);

            var result = await CommerceInformation.ReplaceOneAsync(filter, commerceInformation);

            if (result.ModifiedCount <= 0){
                await CommerceInformation.InsertOneAsync(commerceInformation);
            }

            return commerceInformation;
        }
    }
}