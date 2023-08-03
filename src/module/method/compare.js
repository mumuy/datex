export default function(datex,proto){
    
    Object.assign(proto,{
        isAfter(that,unit = 'timestamp'){
            that = datex(that);
            return this.get(unit)>that.get(unit);
        },
        isBefore(that,unit = 'timestamp'){
            that = datex(that);
            return this.get(unit)<that.get(unit);
        },
        isBetween(startDate,endDate,unit = 'timestamp'){
            startDate = datex(startDate);
            endDate = datex(endDate);
            return this.get(unit)>startDate.get(unit)&&this.get(unit)<endDate.get(unit);
        },
        isSame(that,unit = 'timestamp'){
            that = datex(that);
            return this.get(unit)==that.get(unit);
        }
    });
};
