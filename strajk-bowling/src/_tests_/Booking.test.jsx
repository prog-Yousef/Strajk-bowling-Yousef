import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Booking from '../views/Booking';
import React from "react";
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Booking", () => {
  let timeInput, bookingButton, lanesInput, peopleInput, ShoeButton, dateInput;

  beforeEach(() => {
    render(<MemoryRouter><Booking /></MemoryRouter>);

    // Set up the inputs and buttons here so they are accessible in all tests
    timeInput = screen.getByPlaceholderText("Time");
    bookingButton = screen.getByText("strIIIIIike!"); // Replace with correct button text
    lanesInput = screen.getByLabelText("Number of lanes");
    peopleInput = screen.getByPlaceholderText("Number of awesome bowlers");
    ShoeButton = screen.getByRole("+"); // Ensure this is the correct role
    dateInput = screen.getByPlaceholderText("Date");
  });

  it("should render the Booking form", () => {
    fireEvent.change(timeInput, { target: { value: "11:00" } });
    fireEvent.change(dateInput, { target: { value: "2023-01-01" } });
    expect(timeInput.value).toBe("11:00");
    expect(dateInput.value).toBe("2023-01-01");
  });

  it("should show error when fields are missing", async () => {
    fireEvent.change(dateInput, { target: { value: "2023-01-01" } });
    fireEvent.change(timeInput, { target: { value: "11:00" } });

    // Missing the number of players
    fireEvent.change(lanesInput, { target: { value: "1" } });
    fireEvent.click(bookingButton);
    expect(screen.getByText("Alla fälten måste vara ifyllda")).toBeInTheDocument();

    // Now fill in the players but leave out lanes
    fireEvent.change(peopleInput, { target: { value: "2" } });
    fireEvent.click(bookingButton);
    expect(screen.getByText("Alla fälten måste vara ifyllda")).toBeInTheDocument();

    // Fill in everything but leave out shoe size
    fireEvent.change(lanesInput, { target: { value: "1" } });
    fireEvent.click(ShoeButton); // Korrekt knapp
    fireEvent.click(bookingButton);
    expect(screen.getByText("Alla skor måste vara ifyllda")).toBeInTheDocument();
  });

  it("should enable selection of the number of players and lanes", () => {
    fireEvent.change(peopleInput, { target: { value: "2" } });
    fireEvent.change(lanesInput, { target: { value: "1" } });

    expect(peopleInput.value).toBe("2");
    expect(lanesInput.value).toBe("1");
  });

  it("should complete booking and show confirmation page", async () => {
    fireEvent.change(dateInput, { target: { value: "2023-01-01" } });
    fireEvent.change(timeInput, { target: { value: "11:00" } });
    fireEvent.change(lanesInput, { target: { value: "1" } });
    fireEvent.change(peopleInput, { target: { value: "2" } });
    fireEvent.click(ShoeButton); // Korrekt knapp
    fireEvent.click(ShoeButton); // Korrekt knapp
  
    const shoeSizeInputs = screen.getAllByLabelText(/Shoe size \/ person/);
    for (let i = 0; i < shoeSizeInputs.length; i++) {
      fireEvent.change(shoeSizeInputs[i], { target: { value: i === 0 ? "42" : "41" } });
    }
  
    fireEvent.click(bookingButton);
  
    // Wait for the confirmation to be stored in sessionStorage with a timeout of 1000ms
    await waitFor(() => {
      const storedData = sessionStorage.getItem('confirmation');
      expect(storedData).toBeTruthy(); 
      const confirmation = JSON.parse(storedData);
      expect(confirmation).toBeDefined(); // Ensure the confirmation data is properly parsed
    }, { timeout: 1000 }); // Timeout after 1000ms
  });

  it("should show error when too there are more player per lane", async () => {
   


    fireEvent.change(dateInput, { target: { value: "2024-12-12" } });
    fireEvent.change(timeInput, { target: { value: "12:00" } });
    fireEvent.change(peopleInput, { target: { value: "6" } });
    fireEvent.change(lanesInput, { target: { value: "1" } });
    // Use Array.from and forEach instead of the for loop
    Array.from({ length: players }).forEach(() => {
      fireEvent.click(addShoeButton);
    });
  
    const shoeInputs = screen.getAllByLabelText(/Shoe size \/ person/);
    shoeInputs.forEach((input) => {
      fireEvent.change(input, { target: { value: "42" } });
    });
  
    fireEvent.click(bookButton);
  
    await waitFor(() => {
      expect(
        screen.queryByText("Det får max vara 4 spelare per bana")
      ).toBeInTheDocument();
    });
  });
  


});
