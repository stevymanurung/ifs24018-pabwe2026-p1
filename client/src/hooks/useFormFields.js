import { useCallback, useState } from 'react';

/** State formulir sederhana: `bind(name)` menghasilkan props name/value/onChange untuk input terkontrol. */
export function useFormFields(initialValues) {
  const [values, setValues] = useState(initialValues);

  const setField = useCallback((name, value) => setValues((previous) => ({ ...previous, [name]: value })), []);
  const bind = (name) => ({ name, value: values[name], onChange: (event) => setField(name, event.target.value) });
  const reset = useCallback(() => setValues(initialValues), [initialValues]);

  return { values, setField, bind, reset };
}
