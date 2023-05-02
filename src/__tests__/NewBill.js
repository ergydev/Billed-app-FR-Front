/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom"
import '@testing-library/jest-dom/extend-expect'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"

import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"

import router from "../app/Router.js";
import store from "../__mocks__/store.js";
import userEvent from '@testing-library/user-event'


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      const iconActivate = mailIcon.classList.contains('active-icon')
      expect(iconActivate).toBeTruthy()
    })
  })
  
  describe('When I upload a file in the format jpg, jpeg or png file', () => {
    test("Then the input file should display the file name", () => {
      const html = NewBillUI
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      //initiate NewBill
      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const input = screen.getByTestId('file')
      input.addEventListener('change', handleChangeFile)

      // good format
      fireEvent.change(input, {
        target: {
          files: [new File(['image.png'], 'image.png', {
            type: 'image/png'
          })],
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(input.files[0].name).toBe('image.png')
    })
    test("Then a bill is created", () => {
      const html = NewBillUI
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })

      //submit function
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const submit = screen.getByTestId('form-new-bill')
      submit.addEventListener('submit', handleSubmit)
      fireEvent.submit(submit)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
  describe("When I select a file with an incorrect extension", () => {
    test("Then the bill is deleted", () => {
      const html = NewBillUI
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage })
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      const input = screen.getByTestId('file')
      input.addEventListener('change', handleChangeFile)

      fireEvent.change(input, {
        target: {
          files: [new File(['image.txt'], 'image.txt', {
            type: 'image/txt'
          })],
        }
      })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(input.files[0].name).toBe('image.txt')
      
    })
  })
})

// Post integration Test
describe("Given I am an user connected as Employee", () => {
  describe("When I add a new bill", () => {
    test("Then it create a new bill", () => {
      document.body.innerHTML = NewBillUI()

      const inputData = {
        type: 'Transports',
        name: 'Test',
        datepicker: '2022-04-02',
        amount: '250',
        vat: '10',
        pct: '20',
        commentary: 'Testing the bill creation',
        file: new File(["test"], 'test.png', { type: "image/png" })
      }

      const formNewBill = screen.getByTestId('form-new-bill')
      const inputExpenseType = screen.getByTestId('expense-type')
      const inputExpenseName = screen.getByTestId('expense-name')
      const inputAmount = screen.getByTestId('amount')
      const inputDatePicker = screen.getByTestId('datepicker')
      const inputVAT = screen.getByTestId('vat')
      const inputPCT = screen.getByTestId('pct')
      const inputCommentary = screen.getByTestId('commentary')
      const inputFile = screen.getByTestId('file')

      fireEvent.change(inputExpenseType, {
        target: { value: inputData.type}
      })
      expect(inputExpenseType.value).toBe(inputData.type)

      fireEvent.change(inputExpenseName, {
        target: { value: inputData.name}
      })
      expect(inputExpenseName.value).toBe(inputData.name)

      fireEvent.change(inputDatePicker, {
        target: { value: inputData.datepicker}
      })
      expect(inputDatePicker.value).toBe(inputData.datepicker)

      fireEvent.change(inputAmount, {
        target: { value: inputData.amount}
      })
      expect(inputAmount.value).toBe(inputData.amount)

      fireEvent.change(inputVAT, {
        target: { value: inputData.vat}
      })
      expect(inputVAT.value).toBe(inputData.vat)

      fireEvent.change(inputPCT, {
        target: { value: inputData.pct}
      })
      expect(inputPCT.value).toBe(inputData.pct)

      fireEvent.change(inputCommentary, {
        target: { value: inputData.commentary}
      })
      expect(inputCommentary.value).toBe(inputData.commentary)

      userEvent.upload(inputFile, inputData.file)
      expect(inputFile.files[0]).toStrictEqual(inputData.file)
      expect(inputFile.files).toHaveLength(1)

      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => 
            JSON.stringify({
              email: 'email@test.com'
            })
          )
        },
        writable: true
      })

      //mocking navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage
      })

      const  handleSubmit = jest.fn(newBill.handleSubmit)
      formNewBill.addEventListener('submit', handleSubmit)
      fireEvent.submit(formNewBill)
      expect(handleSubmit).toHaveBeenCalled()
    })
    test("Then it fails with a 404 message error", async() =>{
      const html = BillsUI({ error: 'Erreur 404' })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("Then it fails with a 500 message error", async() =>{
      const html = BillsUI({ error: 'Erreur 500' })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})