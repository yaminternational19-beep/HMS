def validate_inventory_item(data: dict) -> None:
    """
    Validates basic constraints for an inventory item.
    """
    quantity = data.get('quantity')
    if quantity is not None:
        try:
            if float(quantity) < 0:
                raise ValueError("Quantity cannot be negative.")
        except ValueError as e:
            if "Quantity cannot be negative" in str(e):
                raise
            raise ValueError("Invalid quantity format.")

    price = data.get('price')
    if price is not None:
        try:
            if float(price) < 0:
                raise ValueError("Price cannot be negative.")
        except ValueError as e:
            if "Price cannot be negative" in str(e):
                raise
            raise ValueError("Invalid price format.")
