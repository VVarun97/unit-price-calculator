import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Tag, Weight, CheckCircle2, DollarSign, ChevronDown } from 'lucide-react';

function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('unit-price-calc-items');
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    name: '',
    price: '',
    quantity: '',
    unit: 'ea' 
  });

  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);

  const unitOptions = [
    { value: 'ea', label: 'each (pc)' },
    { value: 'kg', label: 'kg' },
    { value: 'g', label: 'g' },
    { value: 'lb', label: 'lb' },
    { value: 'oz', label: 'oz' },
    { value: 'l', label: 'L' },
    { value: 'ml', label: 'ml' }
  ];

  useEffect(() => {
    localStorage.setItem('unit-price-calc-items', JSON.stringify(items));
  }, [items]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!form.price || !form.quantity) return;

    const price = parseFloat(form.price);
    const quantity = parseFloat(form.quantity);
    
    if (isNaN(price) || isNaN(quantity) || quantity <= 0) return;

    // Standardize units for comparison
    let stdQty = quantity;
    let stdUnit = form.unit;

    if (form.unit === 'g') { stdQty = quantity / 1000; stdUnit = 'kg'; }
    if (form.unit === 'ml') { stdQty = quantity / 1000; stdUnit = 'l'; }
    if (form.unit === 'oz') { stdQty = quantity / 16; stdUnit = 'lb'; }

    const unitPrice = price / stdQty;

    const newItem = {
      id: Date.now().toString(),
      name: form.name || '',
      price,
      quantity,
      unit: form.unit,
      unitPrice,
      stdUnit
    };

    setItems(prev => [...prev, newItem]);
    setForm({
      ...form,
      price: '',
      quantity: '',
      name: ''
    });
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Find best value per group (name + stdUnit)
  const bestValues = {};
  const groups = items.reduce((acc, item) => {
    const key = `${(item.name || '').toLowerCase().trim()}_${item.stdUnit}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  Object.values(groups).forEach(group => {
    if (group.length > 1) {
      const bestItem = group.reduce((prev, curr) => 
        curr.unitPrice < prev.unitPrice ? curr : prev
      );
      bestValues[bestItem.id] = true;
    }
  });

  return (
    <div className="app-container">
      <header>
        <h1>Value Compare</h1>
        <p className="subtitle">Find the best deal instantly</p>
      </header>

      <div className="layout">
        <section className="input-section">
          <div className="card">
            <form onSubmit={addItem}>
              <div className="form-group">
                <label>Item Name (Optional)</label>
                <div className="input-wrapper">
                  <Tag className="input-icon" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Brand A Coffee"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Price</label>
                <div className="input-wrapper">
                  <DollarSign className="input-icon" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Quantity & Unit</label>
                <div className="input-wrapper">
                  <Weight className="input-icon" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleInputChange}
                    placeholder="1"
                    required
                    style={{ paddingRight: '6.5rem' }}
                  />
                  <div 
                    className="custom-select-wrapper" 
                    tabIndex={0} 
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setUnitDropdownOpen(false);
                      }
                    }}
                  >
                    <button 
                      type="button" 
                      className="custom-select-trigger" 
                      onClick={() => setUnitDropdownOpen(!unitDropdownOpen)}
                    >
                      {unitOptions.find(o => o.value === form.unit)?.label}
                      <ChevronDown size={14} />
                    </button>
                    {unitDropdownOpen && (
                      <div className="custom-select-dropdown">
                        {unitOptions.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            className={`custom-select-option ${form.unit === option.value ? 'selected' : ''}`}
                            onClick={() => {
                              setForm(prev => ({...prev, unit: option.value}));
                              setUnitDropdownOpen(false);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit" className="add-btn">
                <Plus size={20} /> Add Item to Compare
              </button>
            </form>
          </div>
        </section>

        <section className="results-section">
          {items.length === 0 ? (
            <div className="empty-state">
              <Calculator className="empty-icon" />
              <p>Add some items to start comparing values and finding the best deal.</p>
            </div>
          ) : (
            <div className="item-list">
              {items.map((item, index) => {
                const isBestValue = bestValues[item.id];
                
                return (
                  <div key={item.id} className={`item-card ${isBestValue ? 'best-value' : ''}`}>
                    {isBestValue && (
                      <div className="best-value-badge">
                        <CheckCircle2 size={12} /> Best Deal
                      </div>
                    )}
                    <div className="item-info">
                      <div className="item-title">{item.name || `Option ${index + 1}`}</div>
                      <div className="item-details">
                        ${item.price.toFixed(2)} for {item.quantity}{item.unit}
                      </div>
                    </div>
                    <div className="item-price-view">
                      <div className="unit-price">
                        ${item.unitPrice.toFixed(3)} <span>/{item.stdUnit}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="remove-btn"
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
