using MongoDB.Bson;
using MongoDB.Driver;
using Products.Interfaces;
using Products.Models;
using System.IO;

namespace Products.DataAccess
{
    public class CommerceInformationRepository : ICommerceInformationRepository
    {
        private IMongoCollection<CommerceInformation> CommerceInformation { get; set; }

        private IMongoCollection<BsonDocument> Certificate { get; set; }

        public CommerceInformationRepository(DataBaseImplementation mongo)
        {
            CommerceInformation = mongo.database.GetCollection<CommerceInformation>("CommerceInformation");
            Certificate = mongo.database.GetCollection<BsonDocument>("Certificate");
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

            if (result.ModifiedCount <= 0)
            {
                await CommerceInformation.InsertOneAsync(commerceInformation);
            }

            return commerceInformation;
        }

        public async Task<bool> SaveCertificate(Stream certificate, CommerceInformation commerceInformation, CancellationToken cancellationToken)
        {
            byte[] buffer = new byte[16 * 1024];
            using var ms = new MemoryStream();
            int read;
            while ((read = await certificate.ReadAsync(buffer, 0, buffer.Length)) > 0)
            {
                ms.Write(buffer, 0, read);
            }

            BsonDocument pdfDocument = new BsonDocument
            {
                { "CommersName", commerceInformation.name },
                { "content", new BsonBinaryData(ms.ToArray()) }
            };

            await Certificate.InsertOneAsync(pdfDocument, cancellationToken: cancellationToken);
            return true;
        }

        public async Task<byte[]?> GetCertificate(string commersName, CancellationToken cancellationToken)
        {
            var filter = Builders<BsonDocument>.Filter.Eq("CommersName", commersName);
            var document = await Certificate.Find(filter).FirstOrDefaultAsync(cancellationToken);

            if (document is not null)
            {
                var pdfBytes = document["content"].AsBsonBinaryData.Bytes;
                return pdfBytes;
            }
            else
            {
                return null;
            }
        }
    }
}