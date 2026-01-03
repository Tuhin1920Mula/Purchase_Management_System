

const addToLocalPurchase = async (rowData) => {
  await fetch("http://localhost:5000/indent/add-to-localPurchase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rowData),
  });
};

export { addToLocalPurchase };