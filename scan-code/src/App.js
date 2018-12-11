import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import Dropzone from 'react-dropzone'
import classNames from 'classnames'
import XLSX from 'xlsx'
import { Table, Button, Heading } from 'evergreen-ui'
import Quagga from 'quagga'

function getJsonArrayFromData(data) {
  var obj = {}
  var result = []
  var headers = data[0]
  var cols = headers.length
  var row = []

  for (var i = 1, l = data.length; i < l; i++) {
    // get a row to fill the object
    row = data[i]
    // clear object
    obj = {}
    for (var col = 0; col < cols; col++) {
      // fill object with new values
      obj[headers[col]] = row[col]
    }
    // add object in a final result
    result.push(obj)
  }

  return result
}
class App extends Component {
  state = {
    data: null
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    // Do something with files
    console.log(acceptedFiles[0])
    const reader = new FileReader()
    const rABS = !!reader.readAsBinaryString
    reader.onload = e => {
      /* Parse data */
      const bstr = e.target.result
      const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' })
      /* Get first worksheet */
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 })
      console.log(getJsonArrayFromData(data))
      /* Update state */
      const objData = getJsonArrayFromData(data)
      console.log(objData)
      this.setState({ data: objData })
    }
    if (rABS) reader.readAsBinaryString(acceptedFiles[0])
    else reader.readAsArrayBuffer(acceptedFiles[0])
  }

  barcodeScanner = e => {
    const { data } = this.state
    console.log(data)
    Quagga.decodeSingle(
      {
        decoder: {
          readers: ['code_128_reader'] // List of active readers
        },
        locate: true, // try to locate the barcode in the image
        src: './barcode.png' // or 'data:image/jpg;base64,' + data
      },
      result => {
        if (result.codeResult) {
          console.log('result', result.codeResult.code)
          {
            if (data) {
              const updateData = data.filter(
                v => v['MSSV'] === result.codeResult.code
              )
              updateData[0]['Diem danh'] = `Co mat`
              console.log(updateData)
              this.setState({
                data: [...this.state.data, updateData]
              })
            }
          }
        } else {
          console.log('not detected')
        }
      }
    )
  }

  componentDidMount() {
    // /* convert from workbook to array of arrays */
    // const first_worksheet = workbook.Sheets[workbook.SheetNames[0]]
    // const data = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 })
    // console.log(data)
  }
  render() {
    const { data } = this.state
    return (
      <>
        <header className="header">
          <Heading size={600}>Scanner App</Heading>
          <Button
            marginRight={16}
            appearance="primary"
            intent="success"
            iconBefore="edit"
          >
            Check here
          </Button>
        </header>
        <div className="container App">
          <Dropzone onDrop={this.onDrop}>
            {({ getRootProps, getInputProps, isDragActive }) => {
              return (
                <div
                  {...getRootProps()}
                  className={classNames('dropzone', {
                    'dropzone--isActive': isDragActive
                  })}
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Drop files here...</p>
                  ) : (
                    <p>
                      Try dropping some files here, or click to select files to
                      upload.
                    </p>
                  )}
                </div>
              )
            }}
          </Dropzone>

          {data && (
            <div className="bg">
              <Table>
                <Table.Head>
                  <Table.SearchHeaderCell />
                  <Table.TextHeaderCell>MSSV</Table.TextHeaderCell>
                  <Table.TextHeaderCell>Ho va ten</Table.TextHeaderCell>
                  <Table.TextHeaderCell>Diem danh</Table.TextHeaderCell>
                </Table.Head>
                <Table.Body>
                  {data.map(item => (
                    <Table.Row
                      key={item['STT']}
                      isSelectable
                      onSelect={() => alert(item['MSSV'])}
                    >
                      <Table.TextCell>{item['STT']}</Table.TextCell>
                      <Table.TextCell>{item['MSSV']}</Table.TextCell>
                      <Table.TextCell>{item['Ho va ten']}</Table.TextCell>
                      <Table.TextCell isNumber>
                        {item['Diem danh']}
                      </Table.TextCell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}

          <button onClick={this.barcodeScanner}>Scanner</button>
          <div id="yourElement" />
        </div>
      </>
    )
  }
}

export default App
