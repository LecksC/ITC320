class MathTests
{
    constructor()
    {

    }
    test_transform_scale()
    {
        let v = [1,1,1,1];
        let scale = scalem(1,2,3);
        v = transform(v, scale);

        if(v[0] !== 1 || v[1] !== 2 || v[2] !== 3)
            return console.log("transform scale failed.");

        console.log("transform_scale passed");
    }
    test_inverse_transform(v, matrix)
    {
        console.log("testing inverse transform:");
        let newv = transform(v, matrix);
        newv = transform(newv, inverse(matrix));
        if(this.assertEqualV(newv, v))
        {
           console.log("passed");
        }
    }
    test_transform_rotation(v, rot, axis, expected)
    {
        console.log("testing rotate %d:", rot);
        let matrix = rotate(rot, axis);
        v = transform(v, matrix);

        if(this.assertEqualV(expected, v))
        {
           console.log("passed");
        }
    }
    test_transform_translation(v, t, expected)
    {
        console.log("testing translate %f, %f, %f:", t[0], t[1], t[2]);
        let matrix = translate(t[0], t[1], t[2]);
        v = transform(v, matrix);

        if(this.assertEqualV(expected, v))
        {
           console.log("passed");
        }
    }
    test_lineSegmentIntersectsAxisAlignedCenteredBox(bounds, rayStart, rayEnd, expected)
    {
        let intersect = lineSegmentIntersectsAxisAlignedCenteredBox(bounds, rayStart, rayEnd);

        this.assertEqualV(expected, intersect);
    }

    assertEqualF(a,b)
    {
        return Math.abs(a - b) < 0.000001;
    }
    assertEqualV(a,b)
    {
        var equal = this.assertEqualF(a[0],b[0]) && this.assertEqualF(a[1],b[1]) && this.assertEqualF(a[2],b[2]);
        if(!equal)
            console.log("transform failed - expected %f,%f,%f - actual %f,%f,%f", a[0],a[1],a[2], b[0],b[1],b[2],b[3]);
        return equal;
    }
}
//window.onload = function() {
//    let tests = new MathTests();
//    tests.test_transform_scale();
//    tests.test_transform_rotation([1,2,3,1], 90, [1,0,0], [1,-3,2]);
//    tests.test_transform_rotation([1,2,3,1], -90, [1,0,0], [1,3,-2]);
//    tests.test_transform_rotation([1,2,3,1], 180, [1,0,0], [1,-2,-3]);
//    tests.test_transform_rotation([1,2,3,1], -180, [1,0,0], [1,-2,-3]);
//    tests.test_transform_rotation([1,2,3,0], 180, [1,0,0], [1,-2,-3]);
//    tests.test_transform_rotation([1,2,3,0], -180, [1,0,0], [1,-2,-3]);
//    tests.test_inverse_transform([1,2,3,0], scalem(0.5,0.7,0.2));
//    tests.test_inverse_transform([1,2,3,0], mult(translate(10,10,10),mult(scalem(0.5,0.7,0.2), rotate(90, [0,1,0]))));
//
//    let bounds = new BoundingBox();
//    bounds.min = vec3(-4,-5,-6);
//    bounds.max = vec3(9, 8, 7);
//    tests.test_lineSegmentIntersectsAxisAlignedCenteredBox(bounds, [100,1,1], [0,1,1], [9, 1, 1]);
//
//    
//    tests.test_lineSegmentIntersectsAxisAlignedCenteredBox(bounds, [90,80,70], [0,0,0], [9, 8, 7]);
//    
//    tests.test_transform_translation([1,2,3,1],[1,2,3], [2,4,6]);
//}
//
