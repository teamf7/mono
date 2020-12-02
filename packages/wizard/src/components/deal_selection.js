import React from 'react';

export default function WizardDealSelection({ data, onUpdate }) {
  const selected = new Set(data.selected);

  const onSelect = (e) => {
    const val = parseInt(e.target.value);

    if (!e.target.checked) {
      selected.delete(val);
    } else {
      selected.add(val);
    }
    onUpdate(Array.from(selected));
  };

  const list = data.list.map(deal => {
    return <tr key={deal.id} className="table__row">
      <td>{deal.id}</td>
      <td>{deal.sides[0]}</td>
      <td>{deal.sides[1]}</td>
      <td>{deal.sum}</td>
      <td>{deal.text}</td>
      <td>
        <input
          type="checkbox"
          value={deal.id}
          checked={selected.has(deal.id)}
          onChange={onSelect}
        />
      </td>
    </tr>;
  });

  return <>
    <div className="form-title">Выбор сделок</div>
    <div className="question-body-wide">
      <div className="table-wrapper">
        <table className="table">
          <thead className="table__head">
            <tr className="table__row">
              <th>Номер сделки</th>
              <th>Сторона 1</th>
              <th>Сторона 2</th>
              <th>Сумма</th>
              <th>Предмет сделки</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="table__body">
            {list}
          </tbody>
        </table>
      </div>
    </div>
  </>;
}
