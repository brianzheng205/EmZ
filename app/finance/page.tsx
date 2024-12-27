import "../globals.css";

export default function Finance() {
  const headers = [
    "Monthly Em (%)",
    "Monthly Em ($)",
    "Yearly Em (%)",
    "Yearly Em ($)",
    "Monthly Z (%)",
    "Monthly Z ($)",
    "Yearly Z (%)",
    "Yearly Z ($)",
  ];
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
            {headers.map((header, index) => (
              <th className="border-collapse border border-black" key={index}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...posttax].map((category, index) => (
            <tr
              className="border-collapse border border-black"
              key={`post-tax-${index}`}
            >
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
              {headers.map(() => (
                <td className="border-collapse border border-black"></td>
              ))}
            </tr>
          ))}
          {[...pretax].map((category, index) => (
            <tr
              className="border-collapse border border-black"
              key={`pre-tax-${index}`}
            >
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
              {headers.map(() => (
                <td className="border-collapse border border-black"></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
