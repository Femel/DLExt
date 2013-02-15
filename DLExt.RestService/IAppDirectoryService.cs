namespace DLExt.RestService
{
    using System.Collections.Generic;
    using System.ServiceModel;
    using System.ServiceModel.Web;
    using DLExt.Domain;

    [ServiceContract]
    public interface IAppDirectoryService
    {
        [OperationContract]
        [WebGet(UriTemplate = RestUri.GetLocations, ResponseFormat = WebMessageFormat.Json)]
        IEnumerable<LocationDto> GetLocations();

        [OperationContract]
        [WebGet(UriTemplate = RestUri.GetAllPersons, ResponseFormat = WebMessageFormat.Json)]
        IEnumerable<PersonDto> GetAllPersons();

        [OperationContract]
        [WebGet(UriTemplate = RestUri.GetPersons + "?Request={filterRequest}", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        IEnumerable<PersonDto> GetPersons(string filterRequest);

        [OperationContract]
        [WebGet(UriTemplate = RestUri.GetDistributionList + "?Request={filterRequest}", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        string GetDistributionList(string filterRequest);

        [OperationContract]
        [WebInvoke(Method = "POST", UriTemplate = RestUri.GetPersons + "Post", ResponseFormat = WebMessageFormat.Json)]
        IEnumerable<PersonDto> GetPersonsPost(FilterRequest filterRequest);

        [OperationContract]
        [WebInvoke(Method = "POST", UriTemplate = RestUri.GetDistributionList + "Post", ResponseFormat = WebMessageFormat.Json)]
        string GetDistributionListPost(FilterRequest filterRequest);

        [OperationContract]
        [WebGet(UriTemplate = RestUri.GetPersonsGroupedByLocations, ResponseFormat = WebMessageFormat.Json)]
        IDictionary<LocationDto, IEnumerable<PersonDto>> GetPersonsGroupedByLocations();
    }
}