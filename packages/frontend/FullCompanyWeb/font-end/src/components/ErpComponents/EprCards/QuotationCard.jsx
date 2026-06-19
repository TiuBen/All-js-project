import React from "react";

function QuotationCard({ quotation }) {
    return (
        <div style={{ border: "1px solid black", width: "240px", display: "flex", flexDirection: "column" }}>
            QuotationCard
            <div>{quotation.itemName}</div>
            <div>{quotation.neederName}</div>
            <div>{quotation.supplierName}</div>
            <div>{quotation.specification}</div>
            <div>{quotation.itemDetail}</div>
            <div>{quotation.getPrice}</div>
            <div>{quotation.salePrice}</div>
            <div>{quotation.quotationTime}</div>
            <div>{quotation.quotationStaff}</div>
            <div>{quotation.targetProfit}</div>
            <div>{quotation.reviewOpinion}</div>
            <div>{quotation.supplement}</div>
        </div>
    );
}

export default QuotationCard;
