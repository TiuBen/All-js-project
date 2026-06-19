import { useState, useEffect } from "react";
import {TestService}  from 'services/index';

function useTestService() {
    const [content, setContent] = useState("");

    useEffect(() => {
        const _value=TestService.functionInTestService();

        setContent(_value);
    }, [""]);

    return content;
}

export { useTestService };
