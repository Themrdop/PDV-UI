using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Driver;
using Products.Interfaces;
using Products.Models;

namespace Products.DataAccess{
    public class BillRepository : IBillRepository
    {
        private IMongoCollection<Bill> _bills { get; set; }

        public BillRepository(DataBaseImplementation mongo)
        {
            _bills = mongo.database.GetCollection<Bill>("Bills");
        }

        public async Task<IEnumerable<Bill>> GetAllBills(Tuple<DateOnly,DateOnly> dates, CancellationToken cancellationToken){
            var filterBuilder = Builders<Bill>.Filter;
            FilterDefinition<Bill> filter = filterBuilder.Empty;

            var BaseBills = await _bills.FindAsync<Bill>(filter, cancellationToken:cancellationToken);

            var bills = BaseBills.ToList();

            if (bills is null)
                return new List<Bill>();

            bills = bills.Select(bill => {
                                    bill.date = TimeZoneInfo.ConvertTimeFromUtc(bill.date, TimeZoneInfo.FindSystemTimeZoneById("Central America Standard Time"));
                                    return bill;
                                })
                         .Where(bill => bill.date >= dates.Item1.ToDateTime(TimeOnly.MinValue) && 
                                        bill.date <= dates.Item2.ToDateTime(TimeOnly.MaxValue))
                         .ToList();

            return bills;
        } 

        public async Task<Bill> SaveBill(Bill bill, CancellationToken cancellationToken)
        {
            var document = BsonDocument.Parse(JsonSerializer.Serialize(bill));
            document["id"] = ObjectId.Empty;

            var count = _bills.CountDocuments(Builders<Bill>.Filter.Empty, cancellationToken:cancellationToken);

            bill.consecutive = count + 1;

            await _bills.InsertOneAsync(bill, cancellationToken:cancellationToken);

            return bill;
        }

    public Task UpdateAddElectronicBill(Bill bill, CancellationToken cancellationToken)
    {
        var filter = Builders<Bill>.Filter.Eq("consecutive", bill.consecutive);
        var update = Builders<Bill>.Update.Set("electronicBill", bill.electronicBill);
    
        return _bills.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);
    }
  }
}