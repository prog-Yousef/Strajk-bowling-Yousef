import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://h5jbtjv6if.execute-api.eu-north-1.amazonaws.com", () => {
    const data = JSON.parse(sessionStorage.getItem("confirmation"));
    return HttpResponse.json(data);
  }),

  http.post("https://h5jbtjv6if.execute-api.eu-north-1.amazonaws.com", async ({ request }) => {
    const { reservation } = await request.json();

    const price = parseInt(reservation.lanes) * 100 + parseInt(reservation.people) * 120;

    const confirmation = {
      id: "11223344",
      when: reservation.when,
      lanes: reservation.lanes,
      people: reservation.people,
      shoes: reservation.shoes,
      price: price,
      active: true,
    };

    sessionStorage.setItem("confirmation", JSON.stringify(confirmation));
    return HttpResponse.json(confirmation);
  }),
];
