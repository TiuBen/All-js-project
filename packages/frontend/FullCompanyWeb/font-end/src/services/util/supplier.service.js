import useSWR from "swr";

function useGetSupplier(companyName) {
    console.log(companyName);
    const fetcher = (...args) => fetch(...args).then((res) => res.json());

    const _url = `http://localhost:3100/api/v2/erp/${companyName}/supplier`;
    const { data, error, isLoading, isValidating } = useSWR([_url],
        fetcher,
        { revalidateOnFocus: false }
    );
    // const { data, error, isLoading } = useSWR(`http://localhost:3100/v2/test`, fetcher);
    console.log(data, error, isLoading, isValidating);
    return {
        data: data,
        isLoading,
        isError: error,
    };
}

function useGetQuotation(companyName) {
    console.log(companyName);
    const fetcher = (...args) => fetch(...args).then((res) => res.json());

    const _url = `http://localhost:3100/api/v2/erp/${companyName}/quotation`;
    const { data, error, isLoading, isValidating } = useSWR([_url],
        fetcher,
        { revalidateOnFocus: false }
    );
    // const { data, error, isLoading } = useSWR(`http://localhost:3100/v2/test`, fetcher);
    console.log(data, error, isLoading, isValidating);
    return {
        data: data,
        isLoading,
        isError: error,
    };
}

const COMPANY = { 'dd': "dd" };
const ITEM = { 'supplier': 'supplier', 'quotation': "quotation" };


function useGetFromServer(company, item) {
    console.log(company);
    const fetcher = (...args) => fetch(...args).then((res) => res.json());

    const _url = `http://localhost:3100/api/v2/erp/${company}/${item}`;
    console.log(_url);
    const { data, error, isLoading, isValidating } = useSWR([_url],
        fetcher,
        { revalidateOnFocus: false }
    );
    // const { data, error, isLoading } = useSWR(`http://localhost:3100/v2/test`, fetcher);
    console.log(data, error, isLoading, isValidating);
    return {
        data: data,
        isLoading,
        isError: error,
    };
}

export { COMPANY, ITEM, useGetSupplier, useGetQuotation, useGetFromServer };
