export default function mapOrder(array: Array<any>, order: Array<string>, key: string): Array<any> {

    array.sort(function (a, b) {
        const A = a[key];
        const B = b[key];

        if (order.indexOf(A) > order.indexOf(B)) {
            return 1;
        }

        return -1;


    });

    return array;
}