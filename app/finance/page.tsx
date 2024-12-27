import "../globals.css";

export default function Finance() {
  const names = ["Em", "Z"];
  const pretax = new Set([
    "401k",
    "HSA",
    "Insurance",
    "Commute",
    "Gross Base",
    "Gross Stipend",
    "Gross Bonus",
  ]);
  const posttax = new Set([
    "Roth IRA",
    "Housing",
    "Utilities",
    "Food",
    "Insurance",
    "Dates",
  ]);

  function calculateGross(person) {
    let gross = 0;
    if (person.pretax["Gross Base"] !== undefined) {
      gross += person.pretax["Gross Base"].amount;
    }
    if (person.pretax["Gross Stipend"] !== undefined) {
      gross += person.pretax["Gross Stipend"].amount;
    }
    if (person.pretax["Gross Bonus"] !== undefined) {
      gross += person.pretax["Gross Bonus"].amount;
    }
    return gross;
  }

  return (
    <div>
      <table className="border-collapse border border-black">
        <thead>
          <tr>
            <th></th>
            <th className="border-collapse border border-black">Category</th>
            {names.map((name) => (
              <>
                <th className="border-collapse border border-black">
                  Monthly {name} (%)
                </th>
                <th className="border-collapse border border-black">
                  Monthly {name} ($)
                </th>
                <th className="border-collapse border border-black">
                  Yearly {name} (%)
                </th>
                <th className="border-collapse border border-black">
                  Yearly {name} ($)
                </th>
              </>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...posttax].map((category, index) => (
            <tr className="border-collapse border border-black">
              {index === 0 && (
                <td
                  className="border-collapse border border-black"
                  rowSpan={posttax.size}
                >
                  Post-Tax
                </td>
              )}
              <td className="border-collapse border border-black">
                {category}
              </td>
            </tr>
          ))}
        </tbody>
        <tbody>
          {[...pretax].map((category, index) => (
            <tr className="border-collapse border border-black">
              {index === 0 && (
                <td
                  className="border-collapse border border-black"
                  rowSpan={pretax.size}
                >
                  Pre-Tax
                </td>
              )}
              <td className="border-collapse border border-black">
                {category}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
