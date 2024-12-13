import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Booking from "../views/Booking";

describe("Booking", () => {
  let dateInput, timeInput, peopleInput, lanesInput, addShoeButton, bookButton;

  const fillBookingForm = ({ date, time, players, lanes }) => {
    fireEvent.change(dateInput, { target: { value: date } });
    fireEvent.change(timeInput, { target: { value: time } });
    fireEvent.change(peopleInput, { target: { value: String(players) } });
    fireEvent.change(lanesInput, { target: { value: String(lanes) } });
  };

  beforeEach(() => {
    render(
      <MemoryRouter>
        <Booking />
      </MemoryRouter>
    );

    dateInput = screen.getByLabelText(/Date/);
    timeInput = screen.getByLabelText(/Time/);
    peopleInput = screen.getByLabelText(/Number of players/);
    lanesInput = screen.getByLabelText(/Number of lanes/);
    bookButton = screen.getByRole("button", { name: /Book/ });
    addShoeButton = screen.getByRole("button", { name: /\+ Shoe/ });
  });

  it("should show error when some field is missing", async () => {
    fireEvent.change(dateInput, { target: { value: "" } }); // Leaving date field empty
    fireEvent.click(bookButton);

    await waitFor(() => {
      expect(
        screen.getByText("Alla fälten måste vara ifyllda")
      ).toBeInTheDocument();
    });
  });

  it("should show error when no shoes are selected", async () => {
    fillBookingForm({ date: "2024-12-12", time: "12:00", players: 5, lanes: 2 });
    fireEvent.click(bookButton);

    await waitFor(() => {
      expect(
        screen.getByText("Antalet skor måste stämma överens med antal spelare")
      ).toBeInTheDocument();
    });
  });

  it("should show error when not all shoes are filled with value", async () => {
    fillBookingForm({ date: "2024-12-12", time: "12:00", players: 5, lanes: 2 });

    for (let i = 0; i < 5; i++) {
      fireEvent.click(addShoeButton);
    }

    fireEvent.click(bookButton);

    await waitFor(() => {
      expect(
        screen.getByText("Alla skor måste vara ifyllda")
      ).toBeInTheDocument();
    });
  });

  it("should show error when too many players for 1 lane", async () => {
    fillBookingForm({ date: "2024-12-12", time: "12:00", players: 5, lanes: 1 });

    for (let i = 0; i < 5; i++) {
      fireEvent.click(addShoeButton);
    }

    const shoeInputs = screen.getAllByLabelText(/Shoe size \/ person/);
    shoeInputs.forEach((input) => {
      fireEvent.change(input, { target: { value: "42" } });
    });

    fireEvent.click(bookButton);

    await waitFor(() => {
      expect(
        screen.getByText("Det får max vara 4 spelare per bana")
      ).toBeInTheDocument();
    });
  });

  it("should allow adding shoe sizes and display them", async () => {
    fillBookingForm({ date: "2024-12-12", time: "12:00", players: 5, lanes: 2 });

    for (let i = 0; i < 5; i++) {
      fireEvent.click(addShoeButton);
    }

    const shoeInputs = screen.getAllByLabelText(/Shoe size \/ person/);
    shoeInputs.forEach((input) => {
      fireEvent.change(input, { target: { value: "42" } });
    });

    fireEvent.click(bookButton);

    await waitFor(() => {
      shoeInputs.forEach((input) => {
        expect(input.value).toBe("42");
      });
    });
  });

  it("should allow removing a shoe input", async () => {
    fillBookingForm({ date: "2024-12-12", time: "12:00", players: 5, lanes: 2 });

    for (let i = 0; i < 6; i++) {
      fireEvent.click(addShoeButton);
    }

    const shoeInputs = screen.getAllByLabelText(/Shoe size \/ person/);
    shoeInputs.forEach((input) => {
      fireEvent.change(input, { target: { value: "42" } });
    });

    expect(shoeInputs.length).toBe(6);

    const removeShoeButtons = screen.getAllByText("-");
    fireEvent.click(removeShoeButtons[0]);

    const updatedShoeInputs = screen.getAllByLabelText(/Shoe size \/ person/);
    expect(updatedShoeInputs.length).toBe(5);
  });
});
