//
//  NCIChartView.m
//  Tapestry
//
//  Created by Ira on 11/13/13.
//  Copyright (c) 2013 Truststix. All rights reserved.
//

#import "NCIChartView.h"

@interface NCIChartView(){
    int maxXVal;
    int minXVal;
    
    int maxYVal;
    int minYVal;
    
    int chartIndent;
    
    NSDateFormatter* dateFormatter;
    NSMutableArray *yAxisLabels;
    NSMutableArray *xAxisLabels;
}
@property (atomic, strong)NSMutableArray *chartData;
@end

@implementation NCIChartView

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:(CGRect)frame];
    if (self) {
        self.chartData = [[NSMutableArray alloc] init];
        dateFormatter = [[NSDateFormatter alloc] init];
        [dateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
        int yLabelsCount  = 5;
        yAxisLabels = [[NSMutableArray alloc] initWithCapacity:yLabelsCount];
        chartIndent = 50;
        int ind = 0;
        for (ind = 0; ind< yLabelsCount; ind++){
            UILabel *yLabel = [[UILabel alloc] initWithFrame:
                               CGRectMake(10,
                                          chartIndent + ind*(self.bounds.size.height - chartIndent*2)/(yLabelsCount - 1),
                                          50, 20)];
            [yAxisLabels addObject:yLabel];
            [self addSubview:yLabel];
        };
        int xLabelsCount  = 4;
        xAxisLabels = [[NSMutableArray alloc] initWithCapacity:xLabelsCount];
        for (ind = 0; ind< xLabelsCount; ind++){
            UILabel *xLabel = [[UILabel alloc] initWithFrame:
                               CGRectMake(chartIndent + ind*(self.bounds.size.width - chartIndent*2)/(xLabelsCount - 1),
                                          self.bounds.size.height,
                                          150, 20)];
            xLabel.font = [UIFont italicSystemFontOfSize:14];
            CATransform3D transform = CATransform3DMakeRotation(M_PI/3, 0, 0, 1);
           // xLabel.layer.transform = transform;
            
            [xAxisLabels addObject:xLabel];
            [self addSubview:xLabel];
        };
    }
    return self;
}

- (void)addPoint:(NSDate *)date val:(NSString *)value{
    NSLog(@"%@", date);
    NSLog(@"%i", [value integerValue]);
    int dateSeconds = [date timeIntervalSince1970];
    if (!minXVal || minXVal > dateSeconds){
        minXVal = dateSeconds;
    };
    if (!maxXVal || maxXVal < dateSeconds){
        maxXVal = dateSeconds;
    };
    
    int indexValue = [value integerValue];
    if (!minYVal || minYVal > indexValue){
        minYVal = indexValue;
    };
    if (!maxYVal || maxYVal < indexValue){
        maxYVal = indexValue;
    };
    
    [self.chartData addObject:@[date, value]];
}

- (void)drawChart{
    [self setNeedsDisplay];
}

- (void)drawRect:(CGRect)rect {

    float xFork = maxXVal - minXVal;
    float xStep = (self.bounds.size.width - chartIndent*2)/xFork;
    
    float yFork = maxYVal - minYVal;
    float yStep = (self.bounds.size.height - chartIndent*2)/yFork;
    
    UIBezierPath *path = [UIBezierPath bezierPath];
    [path setLineWidth:.5];
    [path moveToPoint:CGPointMake(chartIndent, chartIndent)];
    
    int ind;
    for (ind =0; ind < self.chartData.count; ind++){
        NSDate *date = self.chartData[ind][0];
        int yVal = self.frame.size.height - (chartIndent + ([self.chartData[ind][1] integerValue] - minYVal)*yStep);
        int xVal = chartIndent + ([date timeIntervalSince1970] - minXVal)*xStep;
        [path addLineToPoint:CGPointMake(xVal, yVal)];
        
    };
    
    CGContextRef currentContext = UIGraphicsGetCurrentContext();
    CGContextSetLineCap(currentContext, kCGLineCapRound);
    CGContextSetLineWidth(currentContext, 0.5);
    CGContextSetLineJoin(currentContext, kCGLineJoinRound);
    CGContextBeginPath(currentContext);
    CGContextAddPath(currentContext, path.CGPath);
    CGContextDrawPath(currentContext, kCGPathStroke);

    
    CGFloat dashes[] = { 1, 1 };
    CGContextSetLineDash(currentContext, 0.0,  dashes , 2 );
    if (maxYVal && minYVal){
        for (ind = 0; ind< yAxisLabels.count; ind++){
            UILabel *yLabel = yAxisLabels[ind];
            yLabel.text = [NSString stringWithFormat:@"%.1f", minYVal + ind * yFork/(yAxisLabels.count - 1)];
            CGContextMoveToPoint(currentContext, yLabel.frame.origin.x + chartIndent/2, yLabel.frame.origin.y);
            CGContextAddLineToPoint(currentContext, self.frame.size.width - chartIndent/2, yLabel.frame.origin.y);
            CGContextStrokePath(currentContext);
        };
    };
    
    if (maxXVal && minXVal){
        for (ind = 0; ind< xAxisLabels.count; ind++){
            UILabel *xLabel = xAxisLabels[ind];
            NSDate *date = [NSDate dateWithTimeIntervalSince1970:(minXVal + ind * xFork/(yAxisLabels.count - 1))];
            xLabel.text = [NSString stringWithFormat:@"%@", [dateFormatter stringFromDate: date]];
            CGContextMoveToPoint(currentContext, xLabel.frame.origin.x , xLabel.frame.origin.y + chartIndent/2);
            CGContextAddLineToPoint(currentContext, xLabel.frame.origin.x , chartIndent/2);
            CGContextStrokePath(currentContext);
        };
    };
    
}


@end