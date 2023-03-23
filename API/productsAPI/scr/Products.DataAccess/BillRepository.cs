using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Driver;
using Products.Interfaces;
using Products.Models;

namespace Products.DataAccess{
    public class BillRepository : IBillRepository
    {
        private readonly DataBaseImplementation _database;

        public BillRepository(DataBaseImplementation database)
        {
            this._database = database;
        }

        public async Task<IEnumerable<Bill>> GetAllBills(Tuple<DateOnly,DateOnly> dates, CancellationToken cancellationToken){
            var BaseBills = await _database.Bills.FindAsync<Bill>(Builders<Bill>.Filter.Empty, cancellationToken:cancellationToken);

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

            var count = _database.Bills.CountDocuments(Builders<Bill>.Filter.Empty, cancellationToken:cancellationToken);

            bill.consecutive = count + 1;

            await _database.Bills.InsertOneAsync(bill, cancellationToken:cancellationToken);

            return bill;
        }
    }
}