const app = {
  expenseChart: null,
  budgetData: [],
  debtData: [],

  init() {
    this.budgetData = JSON.parse(localStorage.getItem('budgetData') || "[]");
    this.debtData = JSON.parse(localStorage.getItem('debtData') || "[]");
    this.addEventListeners();
    this.render();
  },

  addEventListeners() {
    document.querySelector('.close-button').onclick = () => this.closeModal();
    window.onclick = (event) => {
      if (event.target == document.getElementById('editModal')) {
        this.closeModal();
      }
    };
  },

  save() {
    localStorage.setItem('budgetData', JSON.stringify(this.budgetData));
    localStorage.setItem('debtData', JSON.stringify(this.debtData));
  },

  render() {
    this.renderBudgetTable();
    this.renderDebtTable();
    this.renderExpenseChart();
  },

  saveAndRender() {
    this.save();
    this.render();
  },

  addTransaction() {
    const item = document.getElementById('item').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const month = document.getElementById('month').value;
    const type = document.getElementById('type').value;
    if (!item || isNaN(amount)) return;
    this.budgetData.push({ month, item, type, amount, category });
    this.saveAndRender();
    this.showToast("Transaction added!", "success");
  },

  editTransaction(i) {
    const t = this.budgetData[i];
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    modalTitle.textContent = 'Edit Transaction';
    modalBody.innerHTML = `
      <label>Concepto: <input id="editItem" value="${t.item}"></label><br>
      <label>Monto: <input id="editAmount" type="number" value="${t.amount}"></label><br>
      <label>Categoría: <input id="editCategory" value="${t.category}"></label><br>
      <button onclick="app.updateTransaction(${i})">Update</button>
    `;
    this.openModal();
  },

  updateTransaction(i) {
    const newItem = document.getElementById('editItem').value;
    const newAmount = parseFloat(document.getElementById('editAmount').value);
    const newCategory = document.getElementById('editCategory').value;
    if (newItem) this.budgetData[i].item = newItem;
    if (!isNaN(newAmount)) this.budgetData[i].amount = newAmount;
    if (newCategory) this.budgetData[i].category = newCategory;
    this.saveAndRender();
    this.closeModal();
    this.showToast("Transaction updated!", "info");
  },

  deleteTransaction(i) {
    if (confirm('Eliminar este registro?')) {
      this.budgetData.splice(i, 1);
      this.saveAndRender();
      this.showToast("Transaction deleted!", "danger");
    }
  },

  addDebt() {
    const name = document.getElementById('debtName').value;
    const total = parseFloat(document.getElementById('debtTotal').value);
    const monthly = parseFloat(document.getElementById('monthlyGoal').value);
    if (!name || isNaN(total) || isNaN(monthly)) return;
    this.debtData.push({ name, total, paid: 0, monthly });
    this.saveAndRender();
    this.showToast("Debt added!", "danger");
  },

  editDebt(i) {
    const d = this.debtData[i];
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    modalTitle.textContent = 'Edit Debt';
    modalBody.innerHTML = `
      <label>Nombre Deuda: <input id="editDebtName" value="${d.name}"></label><br>
      <label>Total Adeudado: <input id="editDebtTotal" type="number" value="${d.total}"></label><br>
      <label>Meta Mensual: <input id="editDebtMonthly" type="number" value="${d.monthly}"></label><br>
      <button onclick="app.updateDebt(${i})">Update</button>
    `;
    this.openModal();
  },

  updateDebt(i) {
    const newName = document.getElementById('editDebtName').value;
    const newTotal = parseFloat(document.getElementById('editDebtTotal').value);
    const newMonthly = parseFloat(document.getElementById('editDebtMonthly').value);
    if (newName) this.debtData[i].name = newName;
    if (!isNaN(newTotal)) this.debtData[i].total = newTotal;
    if (!isNaN(newMonthly)) this.debtData[i].monthly = newMonthly;
    this.saveAndRender();
    this.closeModal();
    this.showToast("Debt updated!", "info");
  },

  deleteDebt(i) {
    if (confirm('Eliminar esta deuda?')) {
      this.debtData.splice(i, 1);
      this.saveAndRender();
      this.showToast("Debt deleted!", "danger");
    }
  },

  makePayment(i) {
    const amount = parseFloat(prompt('Ingrese monto de pago:'));
    if (isNaN(amount)) return;
    this.debtData[i].paid += amount;
    this.saveAndRender();
    this.showToast("Payment made!", "success");
  },

  renderBudgetTable() {
    const tbody = document.querySelector('#budgetTable tbody');
    tbody.innerHTML = '';
    let inc = 0, exp = 0;
    this.budgetData.forEach((e, i) => {
      inc += e.type === 'Income' ? e.amount : 0;
      exp += e.type === 'Expense' ? e.amount : 0;
      const row = `
        <tr>
          <td data-label="Mes">${e.month}</td>
          <td data-label="Concepto">${e.item}</td>
          <td data-label="Tipo">${e.type}</td>
          <td data-label="Monto">${e.amount}</td>
          <td data-label="Categoría">${e.category}</td>
          <td data-label="Acciones">
            <button onclick="app.editTransaction(${i})">Editar</button>
            <button onclick="app.deleteTransaction(${i})">Borrar</button>
          </td>
        </tr>`;
      tbody.innerHTML += row;
    });
    document.getElementById('totalIncome').textContent = `Total Ingresos: $${inc.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `Total Gastos: $${exp.toFixed(2)}`;
    document.getElementById('remainingBalance').textContent = `Saldo Restante: $${(inc - exp).toFixed(2)}`;
  },

  renderDebtTable() {
    const tbody = document.querySelector('#debtTable tbody');
    tbody.innerHTML = '';
    this.debtData.forEach((d, i) => {
      const rem = d.total - d.paid;
      const est = Math.ceil(rem / d.monthly);
      const row = `
        <tr>
          <td data-label="Name">${d.name}</td>
          <td data-label="Total Owed">${d.total}</td>
          <td data-label="Total Paid">${d.paid}</td>
          <td data-label="Remaining">${rem}</td>
          <td data-label="Monthly Goal">${d.monthly}</td>
          <td data-label="Est. Months">${est}</td>
          <td data-label="Action">
            <button onclick="app.makePayment(${i})">Pago</button>
            <button onclick="app.editDebt(${i})">Editar</button>
            <button onclick="app.deleteDebt(${i})">Borrar</button>
          </td>
        </tr>`;
      tbody.innerHTML += row;
    });
  },

  renderExpenseChart() {
    const expenseData = this.budgetData.filter(item => item.type === 'Expense');
    const expenseByCategory = {};
    expenseData.forEach(item => {
      if (expenseByCategory[item.category]) {
        expenseByCategory[item.category] += item.amount;
      } else {
        expenseByCategory[item.category] = item.amount;
      }
    });

    if (this.expenseChart) {
      this.expenseChart.destroy();
    }

    const ctx = document.getElementById('expenseChart').getContext('2d');
    this.expenseChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(expenseByCategory),
        datasets: [{
          label: 'Expenses by Category',
          data: Object.values(expenseByCategory),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Expenses by Category'
          }
        }
      }
    });
  },

  clearAllData() {
    if (confirm("Borrar TODOS los datos?")) {
      localStorage.removeItem('budgetData');
      localStorage.removeItem('debtData');
      this.budgetData.length = 0;
      this.debtData.length = 0;
      this.saveAndRender();
      this.showToast("All data cleared!", "danger");
    }
  },

  importFile() {
    const input = document.getElementById('fileInput');
    if (!input.files.length) return alert('Seleccione un archivo');
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      if (file.name.endsWith('.json')) {
        let js;
        try {
          js = JSON.parse(data);
        } catch {
          return alert('JSON inválido');
        }
        if (Array.isArray(js.budgetData)) this.budgetData.splice(0, this.budgetData.length, ...js.budgetData);
        if (Array.isArray(js.debtData)) this.debtData.splice(0, this.debtData.length, ...js.debtData);
        this.saveAndRender();
      } else if (file.name.match(/\.xls[x]?$/)) {
        const wb = XLSX.read(data, { type: 'binary' });
        const bS = wb.Sheets['Budget Tracker'];
        const dS = wb.Sheets['Debt Tracker'];
        const bJson = XLSX.utils.sheet_to_json(bS);
        const dJson = XLSX.utils.sheet_to_json(dS);
        this.budgetData.splice(0, this.budgetData.length, ...bJson.map(r => ({ month: r.Month, item: r.Item, type: r.Type, amount: parseFloat(r.Amount), category: r.Category })));
        this.debtData.splice(0, this.debtData.length, ...dJson.map(r => ({ name: r.Name, total: parseFloat(r.TotalOwed), paid: parseFloat(r.TotalPaid), monthly: parseFloat(r.MonthlyGoal) })));
        this.saveAndRender();
      } else alert('Tipo de archivo no soportado');
    };
    if (file.name.match(/\.xls[x]?$/)) reader.readAsBinaryString(file);
    else reader.readAsText(file);
  },

  exportToExcel() {
    const budgetDataForExport = this.budgetData.map(entry => ({
      Month: entry.month,
      Item: entry.item,
      Type: entry.type,
      Amount: entry.amount,
      Category: entry.category
    }));

    const debtDataForExport = this.debtData.map(debt => ({
      Name: debt.name,
      TotalOwed: debt.total,
      TotalPaid: debt.paid,
      Remaining: debt.total - debt.paid,
      MonthlyGoal: debt.monthly,
      EstMonths: Math.ceil((debt.total - debt.paid) / debt.monthly)
    }));

    const wb = XLSX.utils.book_new();
    const budgetSheet = XLSX.utils.json_to_sheet(budgetDataForExport);
    const debtSheet = XLSX.utils.json_to_sheet(debtDataForExport);

    XLSX.utils.book_append_sheet(wb, budgetSheet, "Budget Tracker");
    XLSX.utils.book_append_sheet(wb, debtSheet, "Debt Tracker");

    const summary = {};
    budgetDataForExport.forEach(row => {
      const category = row["Category"];
      const amount = parseFloat(row["Amount"]);
      if (!isNaN(amount)) {
        if (!summary[category]) summary[category] = 0;
        summary[category] += amount;
      }
    });

    const summaryArray = [["Category", "Total"]];
    for (const category in summary) {
      summaryArray.push([category, summary[category]]);
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryArray);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const filename = `Budget_And_Debt_Tracker_${yyyy}-${mm}-${dd}.xlsx`;

    XLSX.writeFile(wb, filename);
  },

  openModal() {
    document.getElementById('editModal').style.display = 'block';
  },

  closeModal() {
    document.getElementById('editModal').style.display = 'none';
  },

  showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;

    const colors = {
      success: "#4CAF50",
      info: "#2196F3",
      danger: "#f44336"
    };
    toast.style.backgroundColor = colors[type];

    toast.style.display = "block";
    toast.style.opacity = "1";

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.style.display = "none";
      }, 300);
    }, 2500);
  }
};

app.init();
