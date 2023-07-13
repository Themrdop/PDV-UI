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
            var BaseBills = await _bills.FindAsync<Bill>(Builders<Bill>.Filter.Empty, cancellationToken:cancellationToken);

            var bills = BaseBills.ToEnumerable();

            if(dates is not null && dates.Item1 != DateOnly.MaxValue && dates.Item2 != DateOnly.MinValue)
                bills = bills.Where(bill => DateOnly.FromDateTime(bill.date) >= dates.Item1 && DateOnly.FromDateTime(bill.date) <= dates.Item2).ToList();

            if (bills is null)
                return new List<Bill>();

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