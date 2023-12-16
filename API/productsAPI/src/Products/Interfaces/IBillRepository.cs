using Products.Models;

namespace Products.Interfaces
{
  public interface IBillRepository
  {
    Task<Bill> SaveBill(Bill bill, CancellationToken cancellationToken);
    Task<IEnumerable<Bill>> GetAllBills(CancellationToken cancellationToken);
    Task UpdateAddElectronicBill(Bill bill, CancellationToken cancellationToken);
  }
}