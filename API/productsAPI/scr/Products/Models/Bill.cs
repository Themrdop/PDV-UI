namespace Products.Models
{
    public class Bill
    {
        private const decimal IVA = 0.13M; 
        
        private decimal _total = 0.0M;
        
        public long consecutive {get; set;} = 0L;
        public DateTime date {get; set;} = DateTime.Now;
        public IEnumerable<Product> products {get; set;} = new List<Product>();
        public decimal total 
        {
            get
            {
                return _total;
            } 
            set
            {
                tax = value * IVA;
                _total = value;
            }
        }
        public decimal tax {get; private set;} = 0.0M;
        public ElectronicBill electronicBill {get; set;} = new();

        public override string ToString()
        {
            return $"Factura No. {consecutive} del {date.ToString("dd/MM/yyyy")} con un total de {total.ToString("C2")}";
        }
    }
}