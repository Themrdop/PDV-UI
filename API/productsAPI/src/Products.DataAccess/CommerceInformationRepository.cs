using MongoDB.Bson;
using MongoDB.Driver;
using Products.Interfaces;
using Products.Models;
using System.IO;

namespace Products.DataAccess;

public class CommerceInformationRepository : ICommerceInformationRepository
{
    private IMongoCollection<CommerceInformation> CommerceInformation { get; set; }

    private IMongoCollection<BsonDocument> Certificate { get; set; }

    private IMongoCollection<BsonDocument> Logo { get; set; }

    public CommerceInformationRepository(DataBaseImplementation mongo)
    {
        CommerceInformation = mongo.database.GetCollection<CommerceInformation>("CommerceInformation");
        Certificate = mongo.database.GetCollection<BsonDocument>("Certificate");
        Logo = mongo.database.GetCollection<BsonDocument>("Logo");
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

        var result = await CommerceInformation.ReplaceOneAsync(filter, commerceInformation, cancellationToken: cancellationToken);

        if (result.ModifiedCount <= 0)
        {
            await CommerceInformation.InsertOneAsync(commerceInformation, cancellationToken: cancellationToken);
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

        BsonDocument document = new BsonDocument
            {
                { "CommersName", commerceInformation.name },
                { "content", new BsonBinaryData(ms.ToArray()) }
            };

        var filter = Builders<BsonDocument>.Filter.Eq("CommersName", commerceInformation.name);

        var result = await Certificate.ReplaceOneAsync(filter, document);

        if (result.ModifiedCount <= 0)
        {
            await Certificate.InsertOneAsync(document, cancellationToken: cancellationToken);
        }

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

    public async Task<bool> SaveLogo(Stream logo, CommerceInformation commerceInformation, CancellationToken cancellationToken)
    {
        byte[] buffer = new byte[16 * 1024];
        using var ms = new MemoryStream();
        int read;
        while ((read = await logo.ReadAsync(buffer, 0, buffer.Length)) > 0)
        {
            ms.Write(buffer, 0, read);
        }

        BsonDocument document = new BsonDocument
            {
                { "CommersName", commerceInformation.name },
                { "content", new BsonBinaryData(ms.ToArray()) }
            };

        var filter = Builders<BsonDocument>.Filter.Eq("CommersName", commerceInformation.name);

        var result = await Logo.ReplaceOneAsync(filter, document);

        if (result.ModifiedCount <= 0)
        {
            await Logo.InsertOneAsync(document, cancellationToken: cancellationToken);
        }

        return true;
    }

    public async Task<byte[]?> GetLogo(string commersName, CancellationToken cancellationToken)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("CommersName", commersName);
            var document = await Logo.Find(filter).FirstOrDefaultAsync(cancellationToken);

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
