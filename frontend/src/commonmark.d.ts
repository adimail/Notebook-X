declare module "commonmark" {
  export class Parser {
    parse(input: string): any;
  }
  export class HtmlRenderer {
    render(node: any): string;
  }
}
