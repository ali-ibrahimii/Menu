import { getDictionary } from '@/lib/getDictionary'

export default function Test() {
  async function test() {
    const d = await getDictionary('fa')
    console.log(d)
  }
  
  test()
  

}

