namespace Products.Models
{
    public class ElectronicBill
    {
        public string clave {get; set;} = string.Empty;
        public Person emitter {get; set;} = new();
        public Person recepient {get; set;} = new();
        public string electronicBill {get; set;} = string.Empty;
        public Uri? location {get; set;} = null;
        public string? errorMessages {get; set;} = null;

        public override string ToString()
        {
            return $"Factura electronica con clave {clave} emitida por {emitter} para {recepient}";
        }
    }
}