# EmZ

All things EmZ

# MUI+

[MUI+ Primitives](https://www.mui-treasury.com/primitive) is a good resource for additional components build on top of MUI. For example, EmZ uses `NumberInputField` (named **Number Input** on the website) since MUI doesn't have a input component for numbers.

To use a MUI+ primitive in EmZ, copy the npx command from the MUI+ website and run it in the terminal. This will add the component under `mui-treasury/components` and you can import it like

```
import { NumberInputField } from "mui-treasury/components/number-input";
```
