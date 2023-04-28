public class Pago
{
    public TipoPago tipoPago { get; set; }
    public decimal monto { get; set; }
}

public enum TipoPago
{
    Efectivo,
    Tarjeta,
    Transferencia_DepositoBancario
}