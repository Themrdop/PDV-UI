using Products.Models;

namespace Products.Interfaces
{
  public interface IBillRepository
  {
    Task<Bill> SaveBill(Bill bill, CancellationToken cancellationToken);
    Task<IEnumerable<Bill>> GetAllBills(Tuple<DateOnly, DateOnly> dates, CancellationToken cancellationToken);
    Task UpdateAddElectronicBill(Bill bill, CancellationToken cancellationToken);
    Task<Bill?> GetElectronicBill(long consecutive, CancellationToken cancellationToken);
  }
}