using MongoDB.Driver;
using Products.DataAccess;
using Products.Models;

public class ClientRepository : IClientRepository
{
  private IMongoCollection<Person> _clients { get; set; }

  public ClientRepository(DataBaseImplementation mongo)
  {
    _clients = mongo.database.GetCollection<Person>("Clients");
  }

  public async Task<Person> AddClient(Person person, CancellationToken cancellationToken)
  {
    var cliente = await GetClient(person.numeroIdentificacion, cancellationToken);

    var filter = Builders<Person>.Filter.Eq(p => p.numeroIdentificacion, person.numeroIdentificacion);
    var result = await _clients.ReplaceOneAsync(filter, person);
    if (result.ModifiedCount == 0)
    {
      await _clients.InsertOneAsync(person, cancellationToken: cancellationToken);
    }
    
    return person;
  }

  public async Task<IEnumerable<Person>> GetClient(string numeroIdentificacion, CancellationToken cancellationToken)
  {
    var filter = Builders<Person>.Filter.Eq("numeroIdentificacion", numeroIdentificacion);
    return await _clients.Find(filter).ToListAsync(cancellationToken);
  }
}